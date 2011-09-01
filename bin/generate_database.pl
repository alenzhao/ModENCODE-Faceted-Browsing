#!/usr/bin/perl

# generate database file for use with faceted browsing

use strict;
use warnings;

use JSON;
use FindBin '$Bin';
use lib "$Bin/../lib";
use FacetedBrowsingUtils;
use LWP::Simple 'get','getprint';
use Text::ParseWords 'shellwords';
use Bio::Graphics::FeatureFile;
use FindBin '$Bin';
#use constant CSV     => 'http://localhost/testing/modencode.csv';
use constant CSV     => 'file:./data/modencode-22August2011.csv';
use constant BROWSER => 'http://modencode.oicr.on.ca/fgb2/gbrowse/';
use constant SOURCES => [qw(fly worm fly_ananas fly_dmoj fly_dp fly_simul fly_virilis fly_yakuba)];

use constant DEBUG=>0;

my %DATA;

if (DEBUG) {
    open FH,"$Bin/../data/modencode-22August2011.csv" or die $!;
} 
else {
    unless (open FH, '-|') { # in child
	getprint(CSV);
	exit 0;
    }
}

while (<FH>) {
    chomp;
    my ($id,$title,$file,$path,
	$organism,$target,$technique,
	$format,$factor,$condition,
	undef,undef,undef,undef,undef,
	$submission,$uniform_filename,
	undef,undef,undef,undef,undef,undef,undef,
	$pi) = split ("\t");

    next if $id eq 'DCC id';
    next unless $id;

    my @conditions;
    for my $c (split ';',$condition) {
	my ($key,$value) = split '_',$c;
	if ($key eq 'Compound' && $value =~ /mM/) {
	    $value .= ' salt';
	} elsif ($key eq 'Developmental-Stage') {
	    $value  = fix_stage($value);
	}
	push @conditions,($key,$value) if (defined $key && defined $value);
    }

    $organism = fix_organism($organism);
    $factor   = fix_factor($factor);
    $target   =~ tr/-/ /;
    $pi       = fix_pi($pi);
    $submission =~ s/^modencode_//i;
    my %conditions = @conditions;
    my $label    = join(';',$factor,values %conditions,$technique);
    my $category = find_category($pi,$technique,$target);

    $DATA{$id} = {
	submission => $submission,
	label      => $label,
	organism   => $organism,
	target     => $target,
	technique  => $technique,
	factor    => $factor,
	category  => $category,
	type      => 'data set',
	$pi ? (principal_investigator => $pi) : (),
	@conditions,
    }
}

# add scan data from modencode browser
my (%seenit,%id2track);
for my $source (@{SOURCES()}) {
    my $url  = BROWSER . "$source?action=scan";
    my $scan = get($url) or next;
    my $ff   = Bio::Graphics::FeatureFile->new(-text=>$scan);
    for my $l ($ff->labels) {
	my @select = shellwords($ff->setting($l  => 'select'));      # tracks with subtracks
	my @ds     = shellwords($ff->setting($l  => 'data source')); # tracks without subtracks
	for my $s (@select) {
	    my ($subtrack,$id) = split ';',$s;
	    $id2track{$id}{"$source/$l/$subtrack"}++;
	    $seenit{"$source/$l/$id"}++;
	}
	for my $id (@ds) {
	    $id2track{$id}{"$source/$l"}++ unless $seenit{"$source/$l/$id"}++;
	}
    }
}
for my $id (keys %id2track) {
    next unless $DATA{$id};
    my @tracks = keys %{$id2track{$id}};
    $DATA{$id}{Tracks} = \@tracks;
}

my @ids   = sort {$a<=>$b} keys %DATA;
my @items = map {$DATA{$_}} @ids;

my $json  = JSON->new;
print $json->pretty->encode({items=>\@items,
			     types => {'data set' => {pluralLabel=>'data sets'}}
			    });

exit 0;

