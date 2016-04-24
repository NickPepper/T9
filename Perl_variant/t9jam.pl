#!/usr/bin/perl -w

# a simple Perl script that computes interesting things
# about T9 synonyms
#
# see http://www.unto.net/unto/work/t9.html for more information

use strict;
use constant LIMIT => 1500;
use constant DICTIONARY => 'pepper.dic';

my %T9_Dictionary;
my %T9_Distances;


# main
build_t9_dictionary( );
print_most_synonyms( );
# print_longest_synonyms( );
# print_greatest_distances( );


# convert a text word into the t9 key sequence
sub get_t9
{
    my ( $t9_word ) = lc( $_[0] );
    $t9_word =~ tr/a-z/22233344455566677778889999/;
    return $t9_word;
}


# not the most efficient way, but fine for this example
sub get_words
{
    open ( DICT, DICTIONARY ) or
	die( "Couldn't open " . DICTIONARY . " for reading: $!" );
    
    chomp( my @words = <DICT> );

    close( DICT );
    
    return @words;
}


# populate the T9_Dictionary hash based on the words in DICTIONARY
sub build_t9_dictionary
{
  foreach my $word ( get_words( ) )
  {
      push( @{ $T9_Dictionary{ get_t9( $word ) } }, $word );
  }
}


# return the list of synonyms for a given t9 word
sub get_synonyms
{
    my ( $t9_word ) = @_;

    return @{ $T9_Dictionary{ $t9_word } };
}


# return the number of synonyms for a given t9 word
sub get_num_synonyms
{
    my ( $t9_word ) = @_;

    return scalar( get_synonyms( $t9_word ) );
}


# return the list of t9 words
sub get_t9_words
{
    return keys %T9_Dictionary;
}


# print the t9 words with the most synonyms
sub print_most_synonyms
{
    print "Most synonyms:\n\n";
    
    foreach my $t9_word 
	( ( sort synonym_count_sort get_t9_words( ) )[0..(LIMIT-1)] )
    {
	print_t9_word( $t9_word );
    }

    print "\n";
} 


# sort by the number of synonyms, descending
sub synonym_count_sort
{
    return get_num_synonyms( $b ) <=> get_num_synonyms( $a );
}


# print a t9 word and its synonyms
sub print_t9_word
{
    my ( $t9_word ) = @_;
    print "$t9_word: " . join( ", ", get_synonyms( $t9_word ) ) . "\n";
}


# return the list of t9 words with at least one synonyms
sub get_t9_words_with_synonyms
{
    return grep( get_num_synonyms( $_ ) > 1, get_t9_words( ) );
}


# print the t9 words with the most digits and at least 1 synonym
sub print_longest_synonyms
{
    print "Longest words:\n\n";
    
    foreach my $t9_word 
	( ( sort length_sort get_t9_words_with_synonyms( ) )[0..(LIMIT-1)] )
    {
	print_t9_word( $t9_word );
    }

    print "\n";
} 


# sort by the length of the t9 word, descending
sub length_sort
{
    return length( $b ) <=> length( $a );
}


# return the number of differing characters between two equal length strings
sub get_word_distance
{
    my ( $a, $b ) = @_;
    length $a == length $b or die( 'length $a != length $b' );
    my $distance = 0;
    my @a = split( //, lc $a );
    my @b = split( //, lc $b );
    for ( my $i = 0; $i < scalar @a; $i++ )
    {
	$distance++ if $a[$i] ne $b[$i];
    } 
    return $distance;
}



# return the greatest distance between all pairs of words
sub get_max_distance
{
  my ( @words ) = @_;

  my $max = 0;

  for ( my $i = 0; $i < scalar( @words ) - 1; $i++ )
  {
    for ( my $j = $i + 1; $j < scalar( @words ); $j++ )
    {
      my $distance = get_word_distance( $words[$i], $words[$j] );
      $max = $distance if $distance > $max;
    }
  }

  return $max;
}


# return the greatest synonym distance for a given T9 word
sub get_synonym_distance
{
    my ( $t9_word ) = @_;

    if ( not exists $T9_Distances{ $t9_word } )
    {
	$T9_Distances{ $t9_word } = 
	    get_max_distance( get_synonyms( $t9_word ) );
    }

    return $T9_Distances{ $t9_word };    
}


# sort the T9 words by the distance between the synonyms, descending
sub distance_sort
{
    return get_synonym_distance( $b ) <=> get_synonym_distance( $a );
}


# print the T9 words with the greatest distances between synonyms
sub print_greatest_distances
{
    print "Greatest distances:\n\n";
    
    foreach my $t9_word 
	( ( sort distance_sort get_t9_words( ) )[0..(LIMIT-1)] )
    {
	print_t9_word( $t9_word );
    }

    print "\n";
}
